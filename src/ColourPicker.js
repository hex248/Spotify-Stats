import React, { useState } from "react";
import ReactColorPicker from "@super-effective/react-color-picker";

const ColourPicker = ({ onChange }) => {
    const [colour, setColour] = useState("#d6d6d6");

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
