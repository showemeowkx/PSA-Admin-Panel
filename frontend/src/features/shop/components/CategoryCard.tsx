import React from "react";
import { IonIcon } from "@ionic/react";
import { createOutline } from "ionicons/icons";

interface CategoryCardProps {
  name: string;
  image?: string;
  onClick?: () => void;
  isAdminOnDesktop?: boolean;
  isActive?: boolean;
  onEdit?: (e: React.MouseEvent) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  image,
  onClick,
  isAdminOnDesktop,
  isActive,
  onEdit,
}) => {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col items-center gap-2 cursor-pointer min-w-[80px] select-none transition-all duration-300 z-0"
    >
      <div
        className={`
          relative w-[80px] h-[80px] rounded-[20px] flex items-center justify-center transition-all duration-300 border

          ${isActive ? "bg-orange-500 border-orange-500 text-white" : "bg-gray-100 border-gray-200 text-gray-500"}
          shadow-[0_4px_12px_rgba(0,0,0,0.15)]
          
          ${isActive ? "md:hover:!bg-orange-400 md:hover:!border-orange-400 md:hover:shadow-md" : "md:hover:bg-gray-200 md:hover:border-gray-300 md:hover:shadow-sm"}

          ${isActive ? "group-hover:bg-orange-400 group-hover:border-orange-400" : ""}
          ${isActive ? "md:group-hover:bg-orange-500 md:group-hover:border-orange-500" : ""}
        `}
      >
        {isAdminOnDesktop && onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(e);
            }}
            className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-200 transition-colors z-10"
          >
            <IonIcon icon={createOutline} className="text-sm" />
          </button>
        )}

        {image ? (
          <img
            src={image}
            alt={name}
            className="w-10 h-10 object-contain brightness-0 invert"
          />
        ) : (
          <span className="text-2xl font-bold">{name[0]}</span>
        )}
      </div>

      <span
        className={`
          text-[10px] font-bold text-center leading-tight transition-colors duration-300
          
          text-gray-500
          group-hover:text-gray-700

          md:group-hover:text-gray-500
          md:hover:!text-gray-800
        `}
      >
        {name}
      </span>
    </div>
  );
};

export default CategoryCard;
