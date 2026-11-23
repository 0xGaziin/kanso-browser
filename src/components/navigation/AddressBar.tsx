import { MenuButton } from "./MenuButton";
import { NavControls } from "./NavControls";
import { OmniBox } from "./OmniBox";
import { ShieldBadge } from "./ShieldBadge";

export function AddressBar() {
  return (
    <div className="flex h-12 items-center gap-2 px-3">
      <NavControls />
      <OmniBox />
      <ShieldBadge />
      <MenuButton />
    </div>
  );
}