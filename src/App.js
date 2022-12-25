import './App.scss';
import Species from './Species';
import {useEffect, createContext, useReducer, useContext} from 'react';

const API_URL = 'https://swapi.dev/api/films/2/';
const SPECIES_IMAGES = {
  droid:
    'https://static.wikia.nocookie.net/starwars/images/f/fb/Droid_Trio_TLJ_alt.png',
  human:
    'https://static.wikia.nocookie.net/starwars/images/3/3f/HumansInTheResistance-TROS.jpg',
  trandoshan:
    'https://static.wikia.nocookie.net/starwars/images/7/72/Bossk_full_body.png',
  wookie:
    'https://static.wikia.nocookie.net/starwars/images/1/1e/Chewbacca-Fathead.png',
  yoda: 'https://static.wikia.nocookie.net/starwars/images/d/d6/Yoda_SWSB.png',
};
const CM_TO_IN_CONVERSION_RATIO = 2.54;
//CONTEXT SETUP FOR SWAPI API
const initialSwapiState = {
  isLoading: false,
  hasError: false,
  textError: '',
  species: [],
};
const swapiReducerActions = {
  load: 'LOAD_SPECIES',
  loaded: 'LOADED_SPECIES',
  error: 'LOAD_SPECIES_ERROR',
};
const swapiReducer = (state, action) => {
  switch (action.type) {
    case swapiReducerActions.load:
      return {
        ...state,
        isLoading: true,
        hasError: false,
      };
    case swapiReducerActions.loaded:
      return {
        ...state,
        species: action.payload.species,
        isLoading: false,
      };
    case swapiReducerActions.error:
      return {
        ...state,
        hasError: true,
        isLoading: false,
      };
    default:
      return state;
  }
};
const SwapiContext = createContext();
const SwapiProvider = ({children}) => (
  <SwapiContext.Provider value={useReducer(swapiReducer, initialSwapiState)}>
    {children}
  </SwapiContext.Provider>
);

// CUSTOM HOOK TO CONSUME SWAPI STORE CONTEXT
const useSwapiStore = () => useContext(SwapiContext)[0];
// CUSTOM HOOK TO CONSUME SWAPI STORE DISPATCH
const useSwapiDispatch = () => useContext(SwapiContext)[1];
//END CONTEXT SETUP FOR SWAPI API

//FETCH CLIENT SETUP
const fetchClient = async url => {
  const res = await fetch(url);
  const json = await res.json();
  return json;
};

async function fetchSpecies() {
  try {
    const film = await fetchClient(API_URL);

    const loadSpecies = film.species.map(speciesUrl => {
      return fetchClient(speciesUrl);
    });

    const loadedSpecies = await Promise.all(loadSpecies);
    return {species: loadedSpecies};
  } catch (err) {
    return {hasError: true};
  }
}

//THIS FUNCTION GET THE SPdispatch({type: swapiReducerActions.load});ECIES IMAGE FROM THE ARRAY USING THE SPECIES NAME
function mapImage(speciesName) {
  return SPECIES_IMAGES[
    speciesName.toLowerCase().replace('https', 'http').split("'")[0]
  ];
}

//THIS FUNCTION TRANSLATE THE HEIGHT VALUE TO INCHES VALIDATING IF NOT HAS A VALUE AND RETURNING A N/A STRING.
function translateToInches(averageHeight) {
  if (isNaN(averageHeight)) {
    return 'N/A';
  }
  return `${Math.round(averageHeight / CM_TO_IN_CONVERSION_RATIO)}"`;
}

//SPECIES LIST REACT COMPONENT
function SpeciesList() {
  const {isLoading, hasError, species} = useSwapiStore();
  const dispatch = useSwapiDispatch();

  useEffect(() => {
    dispatch({type: swapiReducerActions.load});

    fetchSpecies()
      .then(result => {
        dispatch({type: swapiReducerActions.loaded, payload: result});
      })
      .catch(error => {
        dispatch({type: swapiReducerActions.error, payload: error});
      });
  }, []);

  if (hasError) {
    return <p>Something went wrong calling swapi</p>;
  }

  if (species?.length > 0) {
    return (
      <>
        {species.map(species => {
          const props = {
            key: species.name,
            name: species.name,
            classification: species.classification,
            designation: species.designation,
            height: translateToInches(species.average_height),
            image: mapImage(species.name),
            numFilms: species.films.length,
            language: species.language,
          };
          return <Species {...props} />;
        })}
      </>
    );
  }

  if (isLoading) {
    return <p>Loading Species... please wait...</p>;
  }

  return <></>;
}

function App() {
  return (
    <div className="App">
      <h1>Empire Strikes Back - Species Listing</h1>
      <SwapiProvider>
        <div className="App-species">
          <SpeciesList />
        </div>
      </SwapiProvider>
    </div>
  );
}

export default App;
