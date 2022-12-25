import './App.scss';
import Species from './Species';
import {useEffect, useState} from 'react';

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

const fetchClient = async url => {
  const res = await fetch(url);
  const json = await res.json();
  return json;
};

function useSwapiSpecies() {
  const [species, setSpecies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (species.length > 0) {
      return;
    }

    const fetchSpecies = async () => {
      try {
        const film = await fetchClient(API_URL);

        const loadSpecies = film.species.map(speciesUrl => {
          return fetchClient(speciesUrl);
        });

        const loadedSpecies = await Promise.all(loadSpecies);

        setSpecies(loadedSpecies);
      } catch (err) {
        setError(err);
      }
    };

    fetchSpecies();

    return false;
  }, [species]);

  return {species, error};
}

function mapImage(speciesName) {
  return SPECIES_IMAGES[
    speciesName.toLowerCase().replace('https', 'http').split("'")[0]
  ];
}

function translateToInches(averageHeight) {
  if (isNaN(averageHeight)) {
    return 'N/A';
  }
  return `${Math.round(averageHeight / CM_TO_IN_CONVERSION_RATIO)}"`;
}

function SpeciesList() {
  const {species, error} = useSwapiSpecies();

  if (error) {
    return 'Something went wrong calling swapi';
  }

  if (species.length > 0) {
    return species.map(species => {
      const props = {
        name: species.name,
        classification: species.classification || '',
        designation: species.designation || '',
        height: translateToInches(species.average_height),
        image: mapImage(species.name),
        numFilms: species.films.length || '',
        language: species.language || '',
      };
      return <Species key={props.name} {...props} />;
    });
  }

  return 'Loading Species... please wait...';
}

function App() {
  return (
    <div className="App">
      <h1>Empire Strikes Back - Species Listing</h1>
      <div className="App-species">
        <SpeciesList />
      </div>
    </div>
  );
}

export default App;
