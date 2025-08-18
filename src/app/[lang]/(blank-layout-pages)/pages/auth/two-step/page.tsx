// Component Imports
import TwoStepEnroll from '@/views/pages/auth/TwoStepEnroll'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const TwoStepEnrollPage = async () => {
  const mode = await getServerMode()

  return <TwoStepEnroll mode={mode} />
}

export default TwoStepEnrollPage
