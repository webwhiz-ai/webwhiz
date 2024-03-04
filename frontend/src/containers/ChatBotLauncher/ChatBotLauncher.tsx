import * as React from 'react';

import styles from './ChatBotLauncher.module.scss';
import LauncherIcon1 from '../../components/Icons/ChatBotLauncherIcons/LauncherIcon1';
import LauncherIcon2 from '../../components/Icons/ChatBotLauncherIcons/LauncherIcon2';
import LauncherIcon3 from '../../components/Icons/ChatBotLauncherIcons/LauncherIcon3';
import LauncherIcon4 from '../../components/Icons/ChatBotLauncherIcons/LauncherIcon4';
import LauncherIcon5 from '../../components/Icons/ChatBotLauncherIcons/LauncherIcon5';
export interface ChatBotLauncherProps {
  backgroundColor: string;
  fontColor: string;
  launcherIcon?: string;
}

interface IconComponent {
  [key: string]: React.FC;
}

const iconComponents: IconComponent = {
  icon1: LauncherIcon1,
  icon2: LauncherIcon2,
  icon3: LauncherIcon3,
  icon4: LauncherIcon4,
  icon5: LauncherIcon5,
};

const ChatBotLauncher = ({
  backgroundColor,
  fontColor,
  launcherIcon,
}: ChatBotLauncherProps) => {
  const IconComponent = launcherIcon
    ? iconComponents[launcherIcon]
    : iconComponents['icon1'];
  return (
    <div className={styles.chatLauncher}>
      <button
        className={styles.chatLauncherBtn}
        id="chatLauncherBtn"
        style={{ backgroundColor: backgroundColor, color: fontColor }}
      >
        <IconComponent />
      </button>
    </div>
  );
};

export default ChatBotLauncher;
