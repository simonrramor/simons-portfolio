interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike;
};

export function isConstrainedConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  const connection = (navigator as NavigatorWithConnection).connection;
  if (!connection) return false;
  return connection.saveData === true || ['slow-2g', '2g', '3g'].includes(connection.effectiveType ?? '');
}
