import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import { add, remove, trashOutline } from "ionicons/icons";

interface SearchProductCardProps {
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
  onRemove?: () => void;
}

const SearchProductCard: React.FC<SearchProductCardProps> = ({
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
  onRemove,
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      setQuantity(val);
    } else if (e.target.value === "") {
      setQuantity(0);
    }
  };

  const handleInputBlur = () => {
    if (quantity < 1 || isNaN(quantity)) {
      setQuantity(1);
    }
  };

  const discountPercentage = oldPrice
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  const isUnavailable = !isActive || isOutOfStock;

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm mb-2.5 gap-3 transition-all ${isUnavailable ? "opacity-75 grayscale-[30%]" : ""}`}
    >
      <div className="w-14 h-14 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center relative overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg opacity-20">📷</span>
        )}

        {isUnavailable && (
          <div className="absolute inset-0 bg-white/40 z-10 backdrop-blur-[0.5px]"></div>
        )}

        {discountPercentage > 0 && !isUnavailable && (
          <div className="absolute top-0 left-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-br-lg z-10">
            -{discountPercentage}%
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-sm text-gray-800 truncate leading-tight">
            {name}
          </h3>

          {isCartItem && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onRemove) onRemove();
              }}
              className="text-gray-300 hover:text-red-500 transition-colors shrink-0 p-0.5 -mt-0.5 -mr-0.5"
            >
              <IonIcon icon={trashOutline} className="text-[16px]" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-1 mt-0.5">
          <p className="text-[10px] text-gray-400 font-medium">{unit}</p>

          {!isActive ? (
            <span className="text-[8px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              Неактивний
            </span>
          ) : isOutOfStock ? (
            <span className="text-[8px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              Немає в наяв.
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`font-black text-sm leading-none ${oldPrice ? "text-red-500" : "text-gray-900"} ${isUnavailable ? "text-gray-500" : ""}`}
          >
            {price}{" "}
            <span className="text-[10px] font-normal text-gray-400">₴</span>
          </span>
          {oldPrice && (
            <span className="text-[10px] text-gray-400 line-through leading-none decoration-red-400/50">
              {oldPrice} ₴
            </span>
          )}
        </div>
      </div>

      {isCartItem ? (
        <div
          className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDecrease}
            className="w-8 h-8 flex items-center justify-center text-gray-500 active:bg-gray-200 rounded-full transition-colors"
          >
            <IonIcon icon={remove} className="text-lg" />
          </button>

          <input
            type="number"
            value={quantity || ""}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-6 text-center bg-transparent font-bold text-sm text-gray-800 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 m-0"
            min="1"
          />

          <button
            onClick={handleIncrease}
            className="w-8 h-8 flex items-center justify-center text-orange-600 active:bg-orange-100 rounded-full transition-colors"
          >
            <IonIcon icon={add} className="text-lg" />
          </button>
        </div>
      ) : (
        <button
          disabled={isUnavailable}
          onClick={(e) => {
            e.stopPropagation();
          }}
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

export default SearchProductCard;
