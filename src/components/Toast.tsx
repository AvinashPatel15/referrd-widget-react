import "./toast.css";

const Toast = ({
  message,
  type = "default",
}: {
  message: string;
  type?: string;
}) => {
  const toastClassName = `toast ${type}`;

  return (
    <>
      <div
        style={{ transition: "opacity 0.3s ease-in-out" }}
        className={toastClassName}
      >
        <p>{message}</p>
      </div>
    </>
  );
};

export default Toast;
