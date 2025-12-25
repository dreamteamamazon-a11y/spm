import { Topic } from './types';

const COLORS = [
  'bg-red-200', 'bg-orange-200', 'bg-amber-200', 'bg-yellow-200', 'bg-lime-200',
  'bg-green-200', 'bg-emerald-200', 'bg-teal-200', 'bg-cyan-200', 'bg-sky-200',
  'bg-blue-200', 'bg-indigo-200', 'bg-violet-200', 'bg-purple-200', 'bg-fuchsia-200',
  'bg-pink-200', 'bg-rose-200'
];

const getRandomColor = (index: number) => COLORS[index % COLORS.length];

export const PREDEFINED_TOPICS: Topic[] = [
  { id: 'animals', label: 'Animals', emoji: '🐶' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'food', label: 'Food', emoji: '🍎' },
  { id: 'toys', label: 'Toys', emoji: '🧸' },
  { id: 'school', label: 'School', emoji: '🏫' },
  { id: 'colors', label: 'Colors', emoji: '🌈' },
  { id: 'feelings', label: 'Feelings', emoji: '😊' },
  { id: 'weather', label: 'Weather', emoji: '☀️' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'clothes', label: 'Clothes', emoji: '👕' },
  { id: 'body', label: 'My Body', emoji: '👀' },
  { id: 'house', label: 'House', emoji: '🏠' },
  { id: 'garden', label: 'Garden', emoji: '🌻' },
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'space', label: 'Space', emoji: '🚀' },
  { id: 'dinos', label: 'Dinosaurs', emoji: '🦖' },
  { id: 'cars', label: 'Cars', emoji: '🚗' },
  { id: 'birthday', label: 'Birthdays', emoji: '🎂' },
  { id: 'holidays', label: 'Holidays', emoji: '🎄' },
  { id: 'pets', label: 'Pets', emoji: '🐱' },
  { id: 'jungle', label: 'Jungle', emoji: '🦁' },
  { id: 'ocean', label: 'Ocean', emoji: '🐳' },
  { id: 'farm', label: 'Farm', emoji: '🐮' },
  { id: 'doctor', label: 'Doctor', emoji: '🩺' },
  { id: 'hero', label: 'Superheroes', emoji: '🦸' },
  { id: 'princess', label: 'Princesses', emoji: '👸' },
  { id: 'monsters', label: 'Monsters', emoji: '👾' },
  { id: 'magic', label: 'Magic', emoji: '✨' },
  { id: 'friends', label: 'Friends', emoji: '👫' },
].map((topic, index) => ({
  ...topic,
  color: getRandomColor(index)
}));