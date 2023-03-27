import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface InviteProps {
  id: string;
}

export default function Invite(props: InviteProps) {
  const origin = window.location.origin;

  const copyLink = () => {
    navigator.clipboard.writeText(`${origin}/${props.id}`);

    toast("Link Copied", {
      position: "bottom-center",
      toastId: "pop-up",
      theme: "dark",
      hideProgressBar: true,
      closeButton: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      autoClose: 1000,
    });
  };
  return (
    <div>
      <button className="button" onClick={copyLink}>
        Invite
      </button>
      <ToastContainer className="pop-up-container" pauseOnFocusLoss={false} />
    </div>
  );
}
