interface DropdownInterface {
  label: string;
  name: string;
  options: string[];
}

export default function Dropdown(props: DropdownInterface) {
  return (
    <>
      <label htmlFor={props.name}>{props.label}</label>
      <select id={props.name}>
        {props.options.map((option, index) => (
          <option key={index}>{option}</option>
        ))}
      </select>
    </>
  );
}
