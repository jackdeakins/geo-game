import {useState} from "react";
import Africa from "../assets/af.png";
import NA from "../assets/na.png";
import Europe from "../assets/eu.png";
import Oceania from "../assets/au.png";

function Menu(){
    const [open, setOpen] = useState(false);
    const [hoveredButton, setHoveredButton] = useState(null);

return (
    <div style= {{position: "absolute", top: "16px", left: "16px", zIndex: "1000", width: "fit-content"}}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
    >
        <button
            style={{
                background: "#1e790b", //change
                border: "none",
                borderRadius: "8px",
                padding: "10px 14px",
                cursor: "pointer",
                color: "white",
                fontSize: "20px",

            }}
        >
            {open ? "✕" : "☰"}
        </button>  

            <div style = {{
                marginTop: "2.15vw",
                background: "#aad3df",
                borderRadius: "8px",
                padding: "3px 3px",
                display: "flex",
                gap: "4px",
                flexDirection: "column",
                minWidth: "160px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                overflow: "hidden",
                //height: "39.5vw",
                maxHeight: open ? "900px" : "0px",
                opacity: open ? 1 : 0,
                transition: "max-height 0.3s ease, opacity 0.2s ease"
            }}>
                <button style={{...menuItemStyle, 
                    backgroundImage: `url(${Africa})`, 
                    backgroundSize: "120%", 
                    backgroundPosition: "95% 15%",
                    boxShadow: hoveredButton === "home"
                        ? "inset 0 0 0 1000px rgba(0,0,0,0.6)"
                        : "inset 0 0 0 1000px rgba(0,0,0,0.4)",
                    }}
                    onMouseEnter={() => setHoveredButton("home")}
                    onMouseLeave={() => setHoveredButton(null)}
                    >
                    Home
                </button>
                <button style={{...menuItemStyle, 
                    backgroundImage: `url(${NA})`, 
                    backgroundSize: "200%", 
                    backgroundPosition: "65% 70%",
                    boxShadow: hoveredButton === "play"
                        ? "inset 0 0 0 1000px rgba(0,0,0,0.6)"
                        : "inset 0 0 0 1000px rgba(0,0,0,0.4)",
                    }}
                    onMouseEnter={() => setHoveredButton("play")}
                    onMouseLeave={() => setHoveredButton(null)}
                    >
                    Play
                </button>
                <button style={{...menuItemStyle, 
                    backgroundImage: `url(${Europe})`, 
                    backgroundPosition: "60% 60%",
                    boxShadow: hoveredButton === "leaderboard"
                        ? "inset 0 0 0 1000px rgba(0,0,0,0.6)"
                        : "inset 0 0 0 1000px rgba(0,0,0,0.4)",
                    }}
                    onMouseEnter={() => setHoveredButton("leaderboard")}
                    onMouseLeave={() => setHoveredButton(null)}
                    >
                    Leaderboard
                </button>
                <button style={{...menuItemStyle, 
                    backgroundImage: `url(${Oceania})`, 
                    backgroundSize: "200%", 
                    backgroundPosition: "33% 40%",
                    boxShadow: hoveredButton === "settings"
                        ? "inset 0 0 0 1000px rgba(0,0,0,0.6)"
                        : "inset 0 0 0 1000px rgba(0,0,0,0.4)",
                    }}
                    onMouseEnter={() => setHoveredButton("settings")}
                    onMouseLeave={() => setHoveredButton(null)}
                    >
                    Settings
                </button>
            </div>  
    </div>
    );
}

const menuItemStyle = {
    height: "80px",
    backgroundSize: "110%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    borderTop: "2px solid rgba(255,255,255,0.2)",
    borderBottom: "2px solid rgba(255,255,255,0.2)",
    borderLeft: "none",
    borderRight: "none",
    borderRadius: "8px",
    color: "#6b6969",
    display: "flex",
    flexShrink: "0",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    textAlign: "center",
    cursor: "pointer",
    fontSize: "20px",
    fontFamily: "Lucidia-Console",
    width: "100%",
    //boxShadow: "inset 0 0 0 1000px rgba(0,0,0,0.4)",
};

export default Menu;