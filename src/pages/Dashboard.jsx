import { useQuery } from '@tanstack/react-query'
import { navigate } from 'astro/virtual-modules/transitions-router.js'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { data: isAuthenticated } = useQuery({
    queryKey: ['isAuthenticated']
  })
  const navigate = useNavigate()


  return (
    <>
     <div>hhh</div>


    </>
  )
}

export default Dashboard
