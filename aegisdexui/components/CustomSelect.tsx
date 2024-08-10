import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Select,
  MenuItem,
  SelectChangeEvent,
  MenuProps,
  TextField,
} from "@mui/material";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  chainId: number;
  address: string;
}

interface CustomSelectProps {
  coins: Token[];
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
        maxHeight: 130, // Adjusted height for better visibility
        width: 130, // Adjusted width for better visibility
        borderRadius: "30px", // Rounded corners
        overflowY: "auto", // Ensure scrollbar is visible
      },
    },
  };

  const Row = ({ index, style }: ListChildComponentProps) => {
    const coin = coins[index];
    return (
      <MenuItem
        key={coin.symbol}
        value={coin.symbol}
        style={style}
        onClick={() =>
          handleChange({
            target: { value: coin.symbol },
          } as SelectChangeEvent<string>)
        }
      >
        <div className="flex items-center ml-2">
          <Image
            src={coin.icon}
            alt={coin.name}
            width={20}
            height={20}
            className="mr-2"
            loading="lazy"
          />
          {coin.symbol}
        </div>
      </MenuItem>
    );
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
        if (!selectedCoin) return null;
        return (
          <div className="flex items-center">
            <Image
              src={selectedCoin.icon}
              alt={selectedCoin.name}
              width={20}
              height={20}
              className="mr-2"
              loading="lazy"
            />
            {selectedCoin.symbol}
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
      <List height={300} itemCount={coins.length} itemSize={40} width={200}>
        {Row}
      </List>
    </Select>
  );
};

export default CustomSelect;
