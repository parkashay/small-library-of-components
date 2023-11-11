export interface ListProps {
  items: string[];
  handleSelect: (selectedItems: string) => void;
}

const List2 = ({ items, handleSelect }: ListProps) => {
  return (
    <div>
      <ul className=" list-none px-6 py-3 border w-fit rounded">
        {items.map((item, index) => {
          return (
            <li key={item}>
              <input
                type="checkbox"
                name="item"
                id={`li-2-${index}`}
                value={item}
                onChange={(e) => {
                  handleSelect(e.target.value)
                }}
              />
              <label htmlFor={`li-2-${index}`}> {item} </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default List2;
