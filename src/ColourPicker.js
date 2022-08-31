import React, { useState } from "react";
import ReactColorPicker from "@super-effective/react-color-picker";

const ColourPicker = ({ onChange, defaultColour }) => {
    const [colour, setColour] = useState(defaultColour);

    const changeColour = (newColour) => {
        setColour(newColour);
    };

    const finalColour = () => {
        onChange(colour);
    };

    return (
        <>
            <div id="colourPicker">
                <ReactColorPicker color={colour} onChange={changeColour} onInteractionEnd={finalColour} />
            </div>
        </>
    );
};

export default ColourPicker;
