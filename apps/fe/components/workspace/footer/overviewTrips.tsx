import { IoEarth } from 'react-icons/io5'

type Props = Readonly<{
  active: boolean
  onPress: () => void
}>

export default function OverviewTrips({ active, onPress }: Props) {
  return (
    <button
      onClick={onPress}
      className={`flex h-12 w-full items-center justify-start gap-2 rounded-full px-4 text-white transition-all duration-200 ${active ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'}`}
    >
      <IoEarth size={20} />
      <span className="whitespace-nowrap text-[15px]">Chưa có chuyến đi nào...</span>
    </button>
  )
}
