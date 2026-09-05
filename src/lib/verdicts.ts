import { PresetItem } from './types';
import { formatCurrency } from './currencies';

export const CANONICAL_QUOTES = [
  'Your bank account has made a terrible discovery.',
  'Financial responsibility has left the building.',
  'Your balance is {balance}. Your judgement is {zeroBalance}.',
  'You have enough money to make this mistake repeatedly.',
  'One was already too many.',
  'Congratulations on discovering a new way to waste money.',
  'Your bank account would like to speak to you.',
  'This is perhaps the least productive use of {itemPrice}.',
  'A Certified Financial Disaster of the highest pedigree.',
  'Your future self is currently screaming into a pillow.',
  'Adam Smith did not envision the invisible hand buying this.',
  'Warren Buffett has unsubscribed from your existence.',
];

export function generateDynamicQuotes(
  item: string,
  quantity: number,
  bankBalance: number,
  itemPrice: number,
  currencyCode: string
): string[] {
  const formattedBalance = formatCurrency(bankBalance, currencyCode);
  const formattedZero = formatCurrency(0, currencyCode);
  const formattedPrice = formatCurrency(itemPrice, currencyCode);

  const dynamicList: string[] = [];

  if (quantity > 1) {
    dynamicList.push(`You can buy ${quantity.toLocaleString()} of these. Please don't.`);
    dynamicList.push(`You have enough money to make this mistake ${quantity.toLocaleString()} times consecutively.`);
  } else if (quantity === 1) {
    dynamicList.push('One was already too many.');
    dynamicList.push(`Your entire liquidity is hanging on a single ${item}.`);
  } else {
    dynamicList.push("You can't even afford one. Your wallet has saved you from yourself.");
    dynamicList.push('Bankruptcy averted purely by mathematical impossibility.');
  }

  dynamicList.push(`Your balance is ${formattedBalance}. Your financial judgement is ${formattedZero}.`);
  dynamicList.push(`This is perhaps the least productive use of ${formattedPrice}.`);
  dynamicList.push('Your bank account has made a terrible discovery.');
  dynamicList.push('Financial responsibility has left the building.');
  dynamicList.push('Your bank account would like to speak to you in private.');

  return dynamicList;
}

export const FUNNY_PRESETS: PresetItem[] = [
  {
    balance: 10000,
    currency: 'INR',
    item: 'A tiny umbrella for my water bottle',
    reason: 'Because my water bottle might get wet in the monsoon.',
    badge: '☂️ Water Bottle Umbrella',
    category: 'useless',
  },
  {
    balance: 25000,
    currency: 'INR',
    item: 'A 5-inch desktop inflatable dancing tube man',
    reason: 'To cheer me up whenever my code compiles with 47 typescript errors.',
    badge: '🕺 Dancing Tube Man',
    category: 'useless',
  },
  {
    balance: 5000,
    currency: 'INR',
    item: '500 squeaking yellow rubber bath ducks',
    reason: 'To fill my roommate’s motorcycle helmet with them overnight.',
    badge: '🦆 Duck Apocalypse',
    category: 'useless',
  },
  {
    balance: 85000,
    currency: 'INR',
    item: 'A high-performance laptop for university coursework',
    reason: 'To attend lectures, write thesis papers, and learn data science.',
    badge: '💻 University Laptop',
    category: 'useful',
  },
  {
    balance: 15000,
    currency: 'INR',
    item: 'Monthly grocery staples, rice, dal, and fresh vegetables',
    reason: 'To sustain human biological life and avoid starvation.',
    badge: '🥦 Basic Nutrition',
    category: 'useful',
  },
  {
    balance: 12000,
    currency: 'INR',
    item: 'Life-sized cardboard cutout of Nicolas Cage',
    reason: 'To place in my window so burglars think I am protected by an Oscar winner.',
    badge: '🎬 Nicolas Cage Cutout',
    category: 'useless',
  },
  {
    balance: 3500,
    currency: 'INR',
    item: 'A laser pointer helmet for my cat',
    reason: 'So he can chase his own forehead in an endless recursive loop.',
    badge: '🐱 Cat Laser Helmet',
    category: 'useless',
  },
];
