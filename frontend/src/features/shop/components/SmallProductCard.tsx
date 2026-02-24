import React, { useState, useEffect, useRef } from "react";
import { IonIcon } from "@ionic/react";
import { add, remove } from "ionicons/icons";

interface SmallProductCardProps {
  name: string;
  price: number;
  unit: string;
  image?: string;
  oldPrice?: number;
  isActive?: boolean;
  isOutOfStock?: boolean;
  onClick?: () => void;
  isCartItem?: boolean;
  initialQuantity?: number;
  availableStock?: number;
  onRemove?: () => void;
  onAddToCart?: () => void;
  onUpdateQuantity?: (qty: number) => void;
}

const SmallProductCard: React.FC<SmallProductCardProps> = ({
  name,
  price,
  unit,
  image,
  oldPrice,
  isActive,
  isOutOfStock,
  onClick,
  isCartItem = false,
  initialQuantity = 1,
  availableStock,
  onRemove,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const [quantity, setQuantity] = useState<number | string>(initialQuantity);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valStr = e.target.value;
    const isPiece = unit.toLowerCase().includes("шт");
    valStr = isPiece
      ? valStr.replace(/[^0-9]/g, "")
      : valStr.replace(/[^0-9.]/g, "");
    setQuantity(valStr);
  };

  const handleInputBlur = () => {
    const val = Number(quantity);
    if (isNaN(val) || val < 0) {
      setQuantity(initialQuantity);
      return;
    }
    const finalVal =
      availableStock !== undefined && val > availableStock
        ? availableStock
        : val;
    setQuantity(finalVal);

    if (finalVal !== initialQuantity) {
      onUpdateQuantity?.(finalVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") inputRef.current?.blur();
  };

  const isUnavailable = !isActive || isOutOfStock;

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm mb-2.5 gap-3 transition-all ${isUnavailable && !isCartItem ? "opacity-75 grayscale-[30%]" : ""}`}
    >
      <div className="w-14 h-14 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center relative overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg opacity-20">📷</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-gray-800 truncate leading-tight">
          {name}
        </h3>
        <p className="text-[10px] text-gray-400 font-medium mb-1">{unit}</p>
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black text-sm ${oldPrice && !isCartItem ? "text-red-500" : "text-gray-900"}`}
          >
            {price} ₴
          </span>
        </div>
      </div>

      {isCartItem ? (
        <div
          className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onRemove?.();
            }}
            className="w-8 h-8 flex items-center justify-center text-gray-500"
          >
            <IonIcon icon={remove} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={quantity}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-10 text-center bg-transparent font-bold text-sm text-gray-800 outline-none"
          />
          <button
            onClick={handleIncrease}
            className="w-8 h-8 flex items-center justify-center text-orange-600"
          >
            <IonIcon icon={add} />
          </button>
        </div>
      ) : (
        <button
          disabled={isUnavailable}
          onClick={handleIncrease}
          className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors ${
            isUnavailable
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-orange-50 text-orange-600 active:bg-orange-500 active:text-white"
          }`}
        >
          <IonIcon icon={add} className="text-lg" />
        </button>
      )}
    </div>
  );
};

export default SmallProductCard;
