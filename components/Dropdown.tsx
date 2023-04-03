interface DropdownInterface {
  label: string;
  name: string;
  options: string[];
  admin: boolean;
}

export default function Dropdown(props: DropdownInterface) {
  return (
    <>
      <label htmlFor={props.name}>{props.label}</label>
      <select id={props.name} tabIndex={props.admin ? 0 : -1}>
        {props.options.map((option, index) => (
          <option key={index}>{option}</option>
        ))}
      </select>
    </>
  );
}
