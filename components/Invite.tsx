import { toast } from "react-toastify";

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
      className: "toast",
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
        Copy Invite Link
      </button>
    </div>
  );
}
