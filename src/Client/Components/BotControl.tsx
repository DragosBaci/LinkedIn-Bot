import React from 'react';
import type { BotState } from '@/Common/Types/BotStatus';
import { BotStatus } from '@/Common/Types/BotStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Client/Components/Ui/Card';
import { Button } from '@/Client/Components/Ui/Button';
import { Badge } from '@/Client/Components/Ui/Badge';
import { Play, Square, Loader2, Info, Rocket } from 'lucide-react';

interface BotControlProps {
  botState: BotState;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const BotControl: React.FC<BotControlProps> = ({
  botState,
  isLoading,
  onStart,
  onStop
}) => {
  const canStart = botState.status === BotStatus.IDLE && !isLoading;
  const canStop = botState.status === BotStatus.RUNNING && !isLoading;

  const getStatusBadge = () => {
    switch (botState.status) {
      case BotStatus.IDLE:
        return <Badge variant="secondary">Idle</Badge>;
      case BotStatus.STARTING:
      case BotStatus.STOPPING:
        return <Badge variant="outline">Transitioning...</Badge>;
      case BotStatus.RUNNING:
        return <Badge variant="default">Running</Badge>;
      case BotStatus.ERROR:
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            Bot Control
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>{botState.message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <Button
            onClick={onStart}
            disabled={!canStart}
            className="flex-1"
            size="lg"
          >
            {isLoading && botState.status === BotStatus.STARTING ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Bot
              </>
            )}
          </Button>
          <Button
            onClick={onStop}
            disabled={!canStop}
            variant="destructive"
            className="flex-1"
            size="lg"
          >
            {isLoading && botState.status === BotStatus.STOPPING ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop Bot
              </>
            )}
          </Button>
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-primary">1.</span>
                Click "Start Bot" to launch the LinkedIn bot
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary">2.</span>
                A browser window will open with LinkedIn
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary">3.</span>
                Monitor the status in real-time
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary">4.</span>
                Click "Stop Bot" when finished
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5" />
              Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                The bot opens LinkedIn in a visible browser window
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                Logs update automatically in real-time
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                You can interact with the browser manually
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                Stopping the bot closes the browser
              </li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
