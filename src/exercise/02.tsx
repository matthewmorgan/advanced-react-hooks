// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

interface PokemonData {
  name: string,
  image: string,
}

type State = {
  status: "idle",
} | {
  status: "pending",
} | {
  status: "resolved",
  data: PokemonData,
} | {
  status: "rejected",
  error: {message: string},
};

type Action = {
  type: "pending",
} | {
  type: "resolved",
  data: PokemonData
} | {
  type: "rejected",
  error: {message: string},
};

function responseReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending'}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data}
    }
    case 'rejected': {
      return {status: 'rejected', error: action.error}
    }
  }
}

function useAsync(asyncCallback: () => Promise<State>, initialState: State): State {
  const [state, dispatch] = React.useReducer(responseReducer, {
    status: 'idle',
    ...initialState,
  })

  React.useEffect(() => {
    const promise = asyncCallback()
    if (!promise) {
      return
    }
    dispatch({type: 'pending'})
    promise.then(
        (data) => {
          // @ts-ignore
          dispatch({type: 'resolved', data})
        },
        error => {
          dispatch({type: 'rejected', error})
        },
    )
  }, [asyncCallback])

  return state
}

function PokemonInfo({pokemonName}) {
  // Define our callback to fetch data from the service iff the name changes.
  // When the pokemonName changes, `React.useCallback` injects a NEW asyncCallback
  // function into `useAsync`, triggering the `useEffect` hook inside `useAsync` to
  // call the service, and dispatch the result to the reducer.
  // Changes in the output value of the reducer cause this component, its consumer
  // to rerender.
  // Typically, a valid name would cause three render cycles, roughly the following flow:
  // 1. pokemonName changes, so React re-renders this component with the "idle" state.
  // 2. useCallback sees the new name, and assigns a new function to asyncCallback
  // 3. This component invokes `useAsync` with the new asyncCallback, running the
  //    reducer on the current pending state.
  // 4. async call to service is made in useEffect
  // 5. reduced state is returned to this component
  // 6. First render cycle completes.
  // 7. dispatch of pending state updates state in PokemonInfo, causing second render cycle
  // 8. asyncCallback hasn't changed, so useEffect doesn't run again.
  // 9. promise resolves from service call, dispatching the result.
  // 10. the dispatch triggers the reducer, updating the state in PokemonInfo for the third and final render.
  const asyncCallback = React.useCallback(() => {
        if (!pokemonName) {
          return
        }
        return fetchPokemon(pokemonName)
      }, [pokemonName]);
  const state = useAsync(
      asyncCallback,
      {status: pokemonName ? 'pending' : 'idle'},
  )

  if (state.status === 'idle' || !pokemonName) {
    return <div>Submit a pokemon</div>
  } else if (state.status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (state.status === 'rejected') {
    throw state.error
  } else if (state.status === 'resolved') {
    return <PokemonDataView pokemon={state.data} />
  }

  throw new Error('This should be impossible')
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true)
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  )
}

export default AppWithUnmountCheckbox
