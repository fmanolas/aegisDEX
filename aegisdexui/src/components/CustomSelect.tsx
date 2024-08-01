import React from "react";
import Image from "next/image";
import { Select, MenuItem, SelectChangeEvent, MenuProps } from "@mui/material";

interface CustomSelectProps {
  coins: Balance[];
  selectedCoin: string;
  handleChange: (event: SelectChangeEvent<string>) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  coins,
  selectedCoin,
  handleChange,
}) => {
  // Define MenuProps to customize the dropdown menu
  const menuProps: Partial<MenuProps> = {
    PaperProps: {
      className: "custom-scrollbar", // Apply custom scrollbar class

      style: {
        maxHeight: 130, // Set the maximum height
        // minHeight: 130,
        maxWidth: 130, // Set the maximum width
        borderRadius: "30px", // Rounded corners
        overflowY: "auto", // Ensure scrollbar is visible
      },
      sx: {
        "& .MuiList-root": {
          padding: 0,
        },
        "& .MuiMenuItem-root": {
          "&:hover": {
            backgroundColor: "#f1f1f1",
          },
        },
      },
    },
  };

  return (
    <Select
      value={selectedCoin}
      onChange={handleChange}
      displayEmpty
      renderValue={(selected) => {
        if (!selected) {
          return <span>Select Coin</span>;
        }
        const selectedCoin = coins.find((coin) => coin.symbol === selected);
        return (
          <div className="flex items-center">
            {selectedCoin && (
              <>
                <Image
                  src={selectedCoin.icon}
                  alt={selectedCoin.name}
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {selectedCoin.symbol}
              </>
            )}
          </div>
        );
      }}
      MenuProps={menuProps} // Apply MenuProps here
      sx={{
        background: "#fbfffe",
        color: "black",
        borderRadius: "25px",
        minWidth: "120px",
        height: "50px",
      }}
    >
      {coins.map((coin) => (
        <MenuItem key={coin.symbol} value={coin.symbol}>
          <div className="flex items-center ml-2">
            <Image
              src={coin.icon}
              alt={coin.name}
              width={20}
              height={20}
              className="mr-2"
            />
            {coin.symbol}
          </div>
        </MenuItem>
      ))}
    </Select>
  );
};

export default CustomSelect;
