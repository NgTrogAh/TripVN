import { Search } from 'lucide-react'

type Props = Readonly<{
  active: boolean
  onPress: () => void
}>

export default function SearchTrips({ active, onPress }: Props) {
  return (
    <button
      onClick={onPress}
      className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-all duration-200 ${active ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'}`}
    >
      <Search size={20} strokeWidth={2} />
    </button>
  )
}
