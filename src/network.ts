// Есть ли интернет. Без него работают уроки, словарь, разговорник и тесты, а ИИ — нет.
import { useEffect, useState } from "react";
import * as Network from "expo-network";

let online = true;
export const isOnline = () => online;

export function useOnline(): boolean {
  const [on, setOn] = useState(online);
  useEffect(() => {
    const apply = (s: Network.NetworkState) => {
      online = s.isConnected !== false && s.isInternetReachable !== false;
      setOn(online);
    };
    Network.getNetworkStateAsync().then(apply).catch(() => {});
    const sub = Network.addNetworkStateListener(apply);
    return () => sub.remove();
  }, []);
  return on;
}
