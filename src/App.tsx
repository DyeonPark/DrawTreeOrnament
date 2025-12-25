import MobileWrapper from './components/MobileWrapper'
import SnowBackground from './components/SnowBackground'
import ChristmasTree from './components/ChristmasTree'

function App() {
  return (
    <MobileWrapper>
      <SnowBackground />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: 'white', marginTop: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>DrawTreeOnment</h1>
        <ChristmasTree />
      </div>
    </MobileWrapper>
  )
}

export default App
