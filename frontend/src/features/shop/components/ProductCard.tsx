import React from "react";
import { IonIcon } from "@ionic/react";
import { add } from "ionicons/icons";

interface ProductCardProps {
  name: string;
  price: number;
  unit: string;
  image?: string;
  oldPrice?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
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
    <div className="bg-white rounded-[24px] p-3 shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden group">
      <div className="aspect-[1/0.9] bg-gray-50 rounded-[18px] mb-2 overflow-hidden flex items-center justify-center relative">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl opacity-20">📷</span>
        )}

        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm z-10">
            -{discountPercentage}%
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="font-bold text-gray-800 text-sm mb-0.5 leading-tight line-clamp-2">
          {name}
        </h3>

        <p className="text-[10px] text-gray-400 font-medium mb-2">{unit}</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {oldPrice && (
              <span className="text-[10px] text-gray-400 line-through decoration-red-400/50">
                {oldPrice} ₴
              </span>
            )}
            <span
              className={`font-black text-base ${oldPrice ? "text-red-500" : "text-gray-900"}`}
            >
              {price}{" "}
              <span className="text-xs font-normal text-gray-400">₴</span>
            </span>
          </div>

          <button className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 active:bg-orange-500 active:text-white transition-colors">
            <IonIcon icon={add} className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
