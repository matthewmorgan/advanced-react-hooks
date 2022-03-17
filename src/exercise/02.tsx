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

function asyncReducer(state: State, action: Action): State {
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

function useAsync(asyncCallback: () => Promise<State>, initialState: State, dependencies: [string]) {
  const [state, dispatch] = React.useReducer(asyncReducer, {
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
          if (data.status !== "resolved"){
            throw new Error("Impossible state");
          }
          // @ts-ignore
          dispatch({type: 'resolved', data})
        },
        error => {
          dispatch({type: 'rejected', error})
        },
    )
  }, dependencies)

  return state
}

function PokemonInfo({pokemonName}) {
  const state = useAsync(
      () => {
        if (!pokemonName) {
          return
        }
        return fetchPokemon(pokemonName)
      },
      {status: pokemonName ? 'pending' : 'idle'},
      [pokemonName],
  )

  // @ts-ignore
  const {data: pokemon, status, error} = state

  if (status === 'idle' || !pokemonName) {
    return <div>Submit a pokemon</div>
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'rejected') {
    throw error
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={pokemon} />
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
