import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BackButton = ({ className = '' }) => {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      className={`back-button ${className}`}
      onClick={() => navigate(-1)}
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeft size={17} />
      <span>Back</span>
    </button>
  )
}

export default BackButton