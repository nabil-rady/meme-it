interface InviteProps {
  id: string;
}

export default function Invite(props: InviteProps) {
  const origin = window.location.origin;
  return (
    <div className="invite">
      <div className="invite-content">Invite your friends</div>
      <button
        className="button"
        onClick={() => navigator.clipboard.writeText(`${origin}/${props.id}`)}
      >
        Copy
      </button>
    </div>
  );
}
