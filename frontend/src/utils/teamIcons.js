import { Settings, Briefcase, Megaphone, Rocket } from '../icons';

const teamIcons = {
  '⚙️': Settings,
  '🎨': Briefcase,
  '📢': Megaphone,
  '🚀': Rocket,
};

const teamColors = {
  Engineering: 'bg-blue-600',
  Design: 'bg-purple-600',
  Marketing: 'bg-pink-600',
  Product: 'bg-green-600',
};

export const getTeamIconDisplay = (team) => {
  const IconComponent = teamIcons[team.icon];
  const colorClass = teamColors[team.name] || 'bg-gray-600';

  return {
    IconComponent,
    colorClass,
    icon: team.icon,
  };
};
