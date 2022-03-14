// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'
import {useReducer} from "react";

type State = {
    count: number,
}

type Action = {
    type: "INCREMENT",
    step: number,
}

function Counter({initialCount = 0, step = 1}) {
    const [state, dispatch] = useReducer(countReducer, {
        count: initialCount,
    })
    const {count} = state
    const increment = () => dispatch({type: 'INCREMENT', step})

    function countReducer(state: State, action: Action) {
        const {type, step} = action
        if (type === 'INCREMENT') {
            return {
                ...state,
                count: state.count + step,
            }
        }
        throw new Error(`Unsupported action type: ${action.type}`)
    }

    return <button onClick={increment}>{count}</button>
}

function App() {
    return <Counter/>
}

export default App
