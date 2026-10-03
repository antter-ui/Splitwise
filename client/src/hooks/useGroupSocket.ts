import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';

export const useGroupSocket = (groupId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!groupId) return;

    const socket = getSocket();

    // Join group room
    socket.emit('join:group', groupId);

    const onDataChange = () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balances', groupId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balances', 'global'] });
    };

    socket.on('expense:created', onDataChange);
    socket.on('expense:deleted', onDataChange);
    socket.on('settlement:created', onDataChange);
    socket.on('member:added', onDataChange);

    return () => {
      socket.emit('leave:group', groupId);
      socket.off('expense:created', onDataChange);
      socket.off('expense:deleted', onDataChange);
      socket.off('settlement:created', onDataChange);
      socket.off('member:added', onDataChange);
    };
  }, [groupId, queryClient]);
};
