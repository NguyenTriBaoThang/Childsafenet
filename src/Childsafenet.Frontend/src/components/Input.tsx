import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, ...rest } = props;
  return (
    <label className="field">
      {label && <div className="label">{label}</div>}
      <input className="input" {...rest} />
    </label>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const { label, ...rest } = props;
  return (
    <label className="field">
      {label && <div className="label">{label}</div>}
      <textarea className="textarea" {...rest} />
    </label>
  );
}