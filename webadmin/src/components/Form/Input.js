import React from "react";

export default function Input(props) {
  return <input {...props} className={"input-custom " + props.className} />;
}
