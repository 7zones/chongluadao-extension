import React from "react";

export default function PageHeader({ title, extra }) {
  return (
    <div className="flex items-center justify-between" style={{ height: 68 }}>
      <h1 className="uppercase font-semibold text-secondary mb-0 text-base">
        {title}
      </h1>
      {extra && (
        <div className="pl-2 flex justify-end items-center">{extra}</div>
      )}
    </div>
  );
}
