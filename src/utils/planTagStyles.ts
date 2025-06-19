// src/utils/planTagStyles.ts
export function getDynamicCssClasses(plan: string) {
  switch (plan) {
    case 'Professional':
      return {
        bgColor: 'bg-cyan-900',
        borderColor: 'border-cyan-700',
        textColor: 'text-cyan-300',
      };
    case 'Community':
      return {
        bgColor: 'bg-neutral-700',
        borderColor: 'border-neutral-500',
        textColor: 'text-neutral-200',
      };
    case 'Standard':
      return {
        bgColor: 'bg-purple-900',
        borderColor: 'border-purple-700',
        textColor: 'text-purple-200',
      };
    case 'Enterprise':
      return {
        bgColor: 'bg-yellow-900',
        borderColor: 'border-yellow-700',
        textColor: 'text-yellow-300',
      };
    case 'Cancelled':
      return {
        bgColor: 'bg-orange-900',
        borderColor: 'border-orange-700',
        textColor: 'text-orange-300',
      };

    default:
      return {
        bgColor: 'bg-neutral-700',
        borderColor: 'border-neutral-500',
        textColor: 'text-white',
      };
  }
}
