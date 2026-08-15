import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { Buffer } from "buffer";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";

const DICEBEAR_API = `https://api.dicebear.com/9.x/adventurer/svg`;

function generateRandomSeed(length = 10) {
  return Math.random().toString(36).substring(2, 2 + length);
}

export default function SetAvatar() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);   // array of { seed, base64 }
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY))
      navigate("/login");
  }, [navigate]);

  const fetchAvatars = async () => {
    setIsLoading(true);
    setSelectedAvatar(undefined);
    const data = [];
    for (let i = 0; i < 12; i++) {
      const seed = generateRandomSeed();
      const url = `${DICEBEAR_API}?seed=${seed}`;
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const base64 = Buffer.from(response.data).toString("base64");
      data.push({ seed, base64 });
    }
    setAvatars(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      const user = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );

      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selectedAvatar].base64,
      });

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem(
          process.env.REACT_APP_LOCALHOST_KEY,
          JSON.stringify(user)
        );
        navigate("/");
      } else {
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    }
  };

  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an Avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map(({ seed, base64 }, index) => (
              <div
                key={seed}
                className={`avatar ${selectedAvatar === index ? "selected" : ""}`}
                onClick={() => setSelectedAvatar(index)}
              >
                <img
                  src={`data:image/svg+xml;base64,${base64}`}
                  alt={`Avatar with seed ${seed}`}
                />
              </div>
            ))}
          </div>
          <div className="button-row">
            <button onClick={fetchAvatars} className="reload-btn">
              Generate New Avatars
            </button>
            <button onClick={setProfilePicture} className="submit-btn">
              Set as Profile Picture
            </button>
          </div>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    h1 {
      color: white;
    }
  }

  .avatars {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.5s ease-in-out;
      cursor: pointer;
      img {
        height: 6rem;
        transition: 0.5s ease-in-out;
      }
    }

    .selected {
      border: 0.4rem solid #4e0eff;
    }
  }

  .button-row {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }

  .reload-btn {
    background-color: transparent;
    color: #4e0eff;
    padding: 1rem 2rem;
    border: 0.15rem solid #4e0eff;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    transition: background-color 0.3s ease;
    &:hover {
      background-color: #4e0eff22;
    }
  }

  .submit-btn {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    &:hover {
      background-color: #4e0eff;
    }
  }
`;
