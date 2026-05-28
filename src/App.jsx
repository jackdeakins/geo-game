import Map from "./components/Map";

function App() {
  return( 
  <div style={{
    height: "100vh",
    width: "100vw",
    backgroundColor: "#1a1a2e",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
  }}>
    <h1 style={{color: "white", fontSize: "24px"}}> Geo Game</h1>
    <div style = {{
      width: "80%",
      height: "82vh",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
    }}>
      <Map />;
    </div>
  </div>
  );
}

export default App;