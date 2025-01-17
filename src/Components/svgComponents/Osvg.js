export default Osvg;

function Osvg({ children }) {
  let color = "";
  if (children === "black") {
    color = "#eee";
  } else {
    color = "#FF7D7D";
  }
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="26" stroke={color} stroke-width="8" />
    </svg>
  );
}
