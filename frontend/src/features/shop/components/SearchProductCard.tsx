import React from "react";
import { IonIcon } from "@ionic/react";
import { add } from "ionicons/icons";

interface SearchProductCardProps {
  name: string;
  price: number;
  unit: string;
  image?: string;
  oldPrice?: number;
}

const SearchProductCard: React.FC<SearchProductCardProps> = ({
  name,
  price,
  unit,
  image,
  oldPrice,
}) => {
  const discountPercentage = oldPrice
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  return (
    <div className="flex items-center p-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm mb-2.5 gap-3">
      <div className="w-14 h-14 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center relative overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg opacity-20">📷</span>
        )}
        {discountPercentage > 0 && (
          <div className="absolute top-0 left-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-br-lg z-10">
            -{discountPercentage}%
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-bold text-sm text-gray-800 truncate leading-tight">
          {name}
        </h3>
        <p className="text-[10px] text-gray-400 font-medium mb-1">{unit}</p>
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black text-sm leading-none ${oldPrice ? "text-red-500" : "text-gray-900"}`}
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

      <button className="w-9 h-9 shrink-0 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 active:bg-orange-500 active:text-white transition-colors">
        <IonIcon icon={add} className="text-lg" />
      </button>
    </div>
  );
};

export default SearchProductCard;
