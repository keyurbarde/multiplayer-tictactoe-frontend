export default Xsvg;

function Xsvg({ children }) {
  let color = "";
  if (children === "black") {
    color = "#eee";
  } else {
    color = "#7ED8FF";
  }
  return (
    <svg
      width="57"
      height="57"
      viewBox="0 0 57 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect
        x="0.410156"
        y="50.9117"
        width="72"
        height="8"
        rx="4"
        transform="rotate(-45 0.410156 50.9117)"
        fill={color}
      />
      <rect
        x="5.65723"
        y="0.192566"
        width="72"
        height="8"
        rx="4"
        transform="rotate(45 5.65723 0.192566)"
        fill={color}
      />
    </svg>
  );
}
