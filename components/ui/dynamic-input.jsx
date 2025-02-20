import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

const DynamicInputField = ({ label, placeholder, onChange, initialData }) => {
  const [inputList, setInputList] = useState(initialData || [""]);

  useEffect(() => {
    setInputList(initialData || [""]);
  }, [initialData]);

  const handleInputChange = (e, index) => {
    const { value } = e.target;
    const list = [...inputList];
    list[index] = value; // Directly update the string
    setInputList(list);
    onChange(list); // Pass updated array to parent
  };

  const handleAddInput = (index) => {
    if (inputList[index]?.trim() === "") {
      alert("Please enter a value before adding!");
      return;
    }
    const list = [...inputList];
    list.splice(index + 1, 0, ""); // Insert a new empty string
    setInputList(list);
    onChange(list);
  };

  const handleRemoveInput = (index) => {
    const list = [...inputList];
    list.splice(index, 1); // Remove the specified index
    setInputList(list);
    onChange(list);
  };

  return (
    <div className="dynamic-input-list">
      {label && <label className="font-bold text-lg">{label}</label>}
      {inputList.map((input, index) => (
        <div key={index} className="flex items-center gap-4 mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e, index)}
            className="border border-gray-300 rounded-lg p-2 flex-1"
            placeholder={placeholder}
          />
          {index === inputList.length - 1 ? (
            <button
              type="button"
              onClick={() => handleAddInput(index)}
              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleRemoveInput(index)}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default DynamicInputField;
