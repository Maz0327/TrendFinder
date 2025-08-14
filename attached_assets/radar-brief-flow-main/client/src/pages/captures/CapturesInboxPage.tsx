import { useMemo, useState } from "react";
import { useCaptures } from "../../hooks/useCaptures";
import CaptureDetailDrawer from "./CaptureDetailDrawer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
