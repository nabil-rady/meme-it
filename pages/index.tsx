import Head from "next/head";
import Image from "next/image";
import Avatar from "../public/avatar/bugs.jpg";
import { BiRefresh } from "react-icons/bi";

export default function Home() {
  return (
    <div className="app">
      <Head>
        <title>Meme It</title>
      </Head>
      <main className="home">
        <h1>Meme It</h1>

        <div className="avatar-container">
          <Image src={Avatar} alt="avatar" className="avatar" priority />
          <button className="change-avatar">
            <BiRefresh className="icon" />
          </button>
        </div>

        <div className="nickname-container">
          <input className="nickname-input" placeholder="Nickname" />
        </div>

        <div className="buttons">
          <button className="button">Join Lobby</button>
          <button className="button">Create New Lobby</button>
        </div>
      </main>
    </div>
  );
}
