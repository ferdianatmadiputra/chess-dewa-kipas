import { Modal } from "@material-ui/core";
import { useState } from "react";

export default function Test() {
  const [open, setOpen] = useState(false);
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div>Testing</div>
    </Modal>
  );
}
