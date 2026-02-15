import React from "react";

interface CategoryCardProps {
  name: string;
  image?: string;
  onClick?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  image,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-2 cursor-pointer min-w-[80px] select-none transition-all duration-300 z-0"
    >
      <div
        className={`
          w-[80px] h-[80px] rounded-[20px] flex items-center justify-center transition-all duration-300 border bg-white
          
          border-gray-100 text-gray-400
          group-hover:border-orange-200 group-hover:text-orange-400

          md:group-hover:border-gray-100 md:group-hover:text-gray-400
          md:hover:!border-orange-200 md:hover:!text-orange-400 md:hover:shadow-md
        `}
      >
        {image ? (
          <img src={image} alt={name} className="w-10 h-10 object-contain" />
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
