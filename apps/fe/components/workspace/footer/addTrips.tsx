import { Plus } from 'lucide-react'

type Props = Readonly<{
  onPress: () => void
}>

export default function AddTrips({ onPress }: Props) {
  return (
    <button
      onClick={onPress}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-950/70 text-orange-400 transition-colors hover:bg-orange-950/85 hover:text-orange-300"
    >
      <Plus size={22} strokeWidth={2} />
    </button>
  )
}
