"use client";
import React, { useState, FormEvent } from "react";

interface AmountFormProps {
  placeholderValue: string;
  customCss?: string;
}

const AmountForm: React.FC<AmountFormProps> = ({
  placeholderValue,
  customCss = "",
}) => {
  const [amount, setAmount] = useState<string>("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Add your form submission logic here
    alert(`Form submitted with amount: ${amount}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex justify-center">
      <input
        className={`text-white text-center pl-10 py-2 bg-transparent focus:outline-none ${customCss}`}
        type="text"
        placeholder={placeholderValue}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button type="submit" className="hidden">
        Submit
      </button>
    </form>
  );
};

export default AmountForm;
