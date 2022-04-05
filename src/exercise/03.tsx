// useContext: simple Counter
// http://localhost:3000/isolated/exercise/03.js

import * as React from 'react'

type ContextType = [number, (newCount: (c) => any) => void]
const CountContext = React.createContext<ContextType>(null);


const CountProvider = ({children, ...rest}) => {
    const [count, setCount] = React.useState(0)

    return (
        <CountContext.Provider value={[count, setCount]} children={children} {...rest}/>
    )
}

const useCount = () => {
    const context = React.useContext(CountContext)
    if (!context) {
        throw new Error("useCount must be used within CountProvider")
    }
    return context
}

function CountDisplay() {
    const [count] = useCount()
    return <div>{`The current count is ${count}`}</div>
}

function Counter() {
    const [_, setCount] = useCount()
    const increment = () => setCount(c => c + 1)
    return <button onClick={increment}>Increment count</button>
}

function App() {
    return (
        <>
            <CountProvider>
                <CountDisplay/>
                <Counter/>
            </CountProvider>
        </>
    )
}

export default App
