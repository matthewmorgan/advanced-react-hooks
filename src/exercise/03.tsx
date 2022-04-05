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

function CountDisplay() {
    const [count] = React.useContext(CountContext)
    return <div>{`The current count is ${count}`}</div>
}

function Counter() {
    const [_, setCount] = React.useContext(CountContext)
    const increment = () => setCount(c => c + 1)
    return <button onClick={increment}>Increment count</button>
}

function App() {
    return (
        <CountProvider>
            <CountDisplay/>
            <Counter/>
        </CountProvider>
    )
}

export default App
